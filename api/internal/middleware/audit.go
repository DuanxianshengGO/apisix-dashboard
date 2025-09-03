/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/log"
)

// AuditMiddleware creates a middleware for audit logging
func AuditMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip audit for certain paths
		if shouldSkipAudit(c.Request.URL.Path) {
			c.Next()
			return
		}

		// Capture request body for audit
		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		// Record start time
		startTime := time.Now()

		// Process request
		c.Next()

		// Log audit after request processing
		go logAuditAsync(c, requestBody, startTime)
	}
}

// shouldSkipAudit determines if audit logging should be skipped for certain paths
func shouldSkipAudit(path string) bool {
	skipPaths := []string{
		"/apisix/admin/audit-logs",
		"/apisix/admin/audit-stats",
		"/apisix/admin/audit-config",
		"/health",
		"/ping",
		"/metrics",
	}

	for _, skipPath := range skipPaths {
		if strings.HasPrefix(path, skipPath) {
			return true
		}
	}

	// Skip GET requests for listing resources (to avoid too many logs)
	if strings.Contains(path, "/apisix/admin/") && strings.HasSuffix(path, "s") {
		return true
	}

	return false
}

// logAuditAsync logs audit information asynchronously
func logAuditAsync(c *gin.Context, requestBody []byte, startTime time.Time) {
	auditStore := store.GetStore(store.HubKeyAuditLog)
	if auditStore == nil {
		return
	}

	// Extract user information from context
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")

	// Determine action based on HTTP method
	action := getActionFromMethod(c.Request.Method)

	// Extract resource and resource ID from path
	resource, resourceID := extractResourceInfo(c.Request.URL.Path, c.Request.Method)

	// Determine status based on response status code
	status := "success"
	errorMsg := ""
	if c.Writer.Status() >= 400 {
		status = "failed"
		errorMsg = "HTTP " + string(rune(c.Writer.Status()))
	}

	// Create audit log entry
	auditLog := &entity.AuditLog{
		UserID:     getStringValue(userID),
		Username:   getStringValue(username),
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Details: map[string]interface{}{
			"method":       c.Request.Method,
			"path":         c.Request.URL.Path,
			"query":        c.Request.URL.RawQuery,
			"status_code":  c.Writer.Status(),
			"duration_ms":  time.Since(startTime).Milliseconds(),
			"request_size": len(requestBody),
		},
		IPAddress: ipAddress,
		UserAgent: userAgent,
		Status:    status,
		ErrorMsg:  errorMsg,
		Timestamp: time.Now().Unix(),
	}

	// Add request body to details if it's not too large
	if len(requestBody) > 0 && len(requestBody) < 1024 {
		var requestData interface{}
		if err := json.Unmarshal(requestBody, &requestData); err == nil {
			auditLog.Details["request_body"] = requestData
		}
	}

	// Create audit log entry
	if _, err := auditStore.Create(c.Request.Context(), auditLog); err != nil {
		log.Errorf("Failed to create audit log: %v", err)
	}
}

// getActionFromMethod maps HTTP methods to audit actions
func getActionFromMethod(method string) string {
	switch method {
	case "GET":
		return "read"
	case "POST":
		return "create"
	case "PUT", "PATCH":
		return "update"
	case "DELETE":
		return "delete"
	default:
		return strings.ToLower(method)
	}
}

// extractResourceInfo extracts resource type and ID from the request path
func extractResourceInfo(path, method string) (resource, resourceID string) {
	// Remove prefix
	path = strings.TrimPrefix(path, "/apisix/admin/")

	// Split path into segments
	segments := strings.Split(path, "/")
	if len(segments) == 0 {
		return "unknown", ""
	}

	// First segment is usually the resource type
	resource = segments[0]

	// Handle special cases
	switch {
	case strings.HasSuffix(resource, "s"):
		// Remove plural 's' for consistency
		resource = strings.TrimSuffix(resource, "s")
	case resource == "ssl":
		// SSL is already singular
	case resource == "proto":
		// Proto is already singular
	}

	// Extract resource ID if present
	if len(segments) > 1 && segments[1] != "" {
		resourceID = segments[1]
	}

	// Handle batch operations
	if len(segments) > 1 && segments[1] == "batch" {
		resourceID = "batch"
	}

	return resource, resourceID
}

// getStringValue safely converts interface{} to string
func getStringValue(value interface{}) string {
	if value == nil {
		return ""
	}
	if str, ok := value.(string); ok {
		return str
	}
	return ""
}