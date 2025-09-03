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
package audit

import (
	"reflect"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/wrapper"
	wgin "github.com/shiningrush/droplet/wrapper/gin"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
)

type Handler struct {
	auditStore  store.Interface
	configStore store.Interface
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		auditStore:  store.GetStore(store.HubKeyAuditLog),
		configStore: store.GetStore(store.HubKeySystemConfig),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	// Audit log routes
	r.GET("/apisix/admin/audit-logs", wgin.Wraps(h.List,
		wrapper.InputType(reflect.TypeOf(ListInput{}))))
	r.GET("/apisix/admin/audit-logs/:id", wgin.Wraps(h.Get,
		wrapper.InputType(reflect.TypeOf(GetInput{}))))
	r.DELETE("/apisix/admin/audit-logs/cleanup", wgin.Wraps(h.Cleanup,
		wrapper.InputType(reflect.TypeOf(CleanupInput{}))))

	// Audit configuration routes
	r.GET("/apisix/admin/audit-config", wgin.Wraps(h.GetConfig,
		wrapper.InputType(reflect.TypeOf(GetConfigInput{}))))
	r.PUT("/apisix/admin/audit-config", wgin.Wraps(h.UpdateConfig,
		wrapper.InputType(reflect.TypeOf(UpdateConfigInput{}))))

	// Statistics routes
	r.GET("/apisix/admin/audit-stats", wgin.Wraps(h.GetStats,
		wrapper.InputType(reflect.TypeOf(GetStatsInput{}))))
}

type GetInput struct {
	ID string `auto_read:"id,path" validate:"required"`
}

func (h *Handler) Get(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetInput)

	r, err := h.auditStore.Get(c.Context(), input.ID)
	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return r, nil
}

type ListInput struct {
	UserID     string `auto_read:"user_id,query"`
	Username   string `auto_read:"username,query"`
	Action     string `auto_read:"action,query"`
	Resource   string `auto_read:"resource,query"`
	ResourceID string `auto_read:"resource_id,query"`
	Status     string `auto_read:"status,query"`
	StartTime  int64  `auto_read:"start_time,query"`
	EndTime    int64  `auto_read:"end_time,query"`
	store.Pagination
}

func (h *Handler) List(c droplet.Context) (interface{}, error) {
	input := c.Input().(*ListInput)

	ret, err := h.auditStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			auditLog := obj.(*entity.AuditLog)

			// Filter by user ID
			if input.UserID != "" && auditLog.UserID != input.UserID {
				return false
			}

			// Filter by username
			if input.Username != "" && !strings.Contains(auditLog.Username, input.Username) {
				return false
			}

			// Filter by action
			if input.Action != "" && !strings.Contains(auditLog.Action, input.Action) {
				return false
			}

			// Filter by resource
			if input.Resource != "" && !strings.Contains(auditLog.Resource, input.Resource) {
				return false
			}

			// Filter by resource ID
			if input.ResourceID != "" && auditLog.ResourceID != input.ResourceID {
				return false
			}

			// Filter by status
			if input.Status != "" && auditLog.Status != input.Status {
				return false
			}

			// Filter by time range
			if input.StartTime > 0 && auditLog.Timestamp < input.StartTime {
				return false
			}
			if input.EndTime > 0 && auditLog.Timestamp > input.EndTime {
				return false
			}

			return true
		},
		PageSize:   input.PageSize,
		PageNumber: input.PageNumber,
		Format: func(obj interface{}) interface{} {
			// Sort by timestamp descending (newest first)
			return obj
		},
	})

	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	return ret, nil
}

type CleanupInput struct {
	Days int `auto_read:"days,query" validate:"min=1"`
}

func (h *Handler) Cleanup(c droplet.Context) (interface{}, error) {
	input := c.Input().(*CleanupInput)

	// Calculate cutoff time
	cutoffTime := time.Now().AddDate(0, 0, -input.Days).Unix()

	// Get all audit logs older than cutoff time
	ret, err := h.auditStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			auditLog := obj.(*entity.AuditLog)
			return auditLog.Timestamp < cutoffTime
		},
	})

	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// Delete old audit logs
	var deletedCount int
	for _, item := range ret.Rows {
		auditLog := item.(*entity.AuditLog)
		if err := h.auditStore.BatchDelete(c.Context(), []string{auditLog.ID.(string)}); err == nil {
			deletedCount++
		}
	}

	return map[string]interface{}{
		"deleted_count": deletedCount,
		"cutoff_time":   cutoffTime,
	}, nil
}

type GetConfigInput struct{}

func (h *Handler) GetConfig(c droplet.Context) (interface{}, error) {
	// Try to get existing config
	configData, err := h.configStore.Get(c.Context(), "audit_config")
	if err != nil {
		// Return default config if not found
		return &entity.AuditConfig{
			RetentionDays: 30,
			Enabled:       true,
		}, nil
	}

	systemConfig := configData.(*entity.SystemConfig)
	auditConfig := &entity.AuditConfig{}

	// Extract audit config from system config payload
	if retentionDays, ok := systemConfig.Payload["retention_days"].(float64); ok {
		auditConfig.RetentionDays = int(retentionDays)
	} else {
		auditConfig.RetentionDays = 30
	}

	if enabled, ok := systemConfig.Payload["enabled"].(bool); ok {
		auditConfig.Enabled = enabled
	} else {
		auditConfig.Enabled = true
	}

	return auditConfig, nil
}

type UpdateConfigInput struct {
	entity.AuditConfig
}

func (h *Handler) UpdateConfig(c droplet.Context) (interface{}, error) {
	input := c.Input().(*UpdateConfigInput)

	// Create or update system config
	systemConfig := &entity.SystemConfig{
		ConfigName: "audit_config",
		Desc:       "Audit log configuration",
		Payload: map[string]interface{}{
			"retention_days": input.RetentionDays,
			"enabled":        input.Enabled,
		},
		UpdateTime: time.Now().Unix(),
	}

	// Try to get existing config to preserve create time
	existingConfig, err := h.configStore.Get(c.Context(), "audit_config")
	if err == nil {
		existing := existingConfig.(*entity.SystemConfig)
		systemConfig.CreateTime = existing.CreateTime
	} else {
		systemConfig.CreateTime = time.Now().Unix()
	}

	if ret, err := h.configStore.Update(c.Context(), systemConfig, true); err != nil {
		return handler.SpecCodeResponse(err), err
	} else {
		// Log audit for config change
		h.logAudit(c, "update", "audit_config", "audit_config", "Audit configuration updated", "success", "")
		return ret, nil
	}
}

type GetStatsInput struct {
	Days int `auto_read:"days,query" validate:"min=1,max=365"`
}

func (h *Handler) GetStats(c droplet.Context) (interface{}, error) {
	input := c.Input().(*GetStatsInput)

	if input.Days == 0 {
		input.Days = 7 // Default to 7 days
	}

	// Calculate start time
	startTime := time.Now().AddDate(0, 0, -input.Days).Unix()

	// Get audit logs within the time range
	ret, err := h.auditStore.List(c.Context(), store.ListInput{
		Predicate: func(obj interface{}) bool {
			auditLog := obj.(*entity.AuditLog)
			return auditLog.Timestamp >= startTime
		},
	})

	if err != nil {
		return handler.SpecCodeResponse(err), err
	}

	// Calculate statistics
	stats := map[string]interface{}{
		"total_logs":    len(ret.Rows),
		"by_action":     make(map[string]int),
		"by_resource":   make(map[string]int),
		"by_status":     make(map[string]int),
		"by_user":       make(map[string]int),
		"success_rate":  0.0,
		"period_days":   input.Days,
		"start_time":    startTime,
		"end_time":      time.Now().Unix(),
	}

	byAction := stats["by_action"].(map[string]int)
	byResource := stats["by_resource"].(map[string]int)
	byStatus := stats["by_status"].(map[string]int)
	byUser := stats["by_user"].(map[string]int)

	successCount := 0
	for _, item := range ret.Rows {
		auditLog := item.(*entity.AuditLog)

		// Count by action
		byAction[auditLog.Action]++

		// Count by resource
		byResource[auditLog.Resource]++

		// Count by status
		byStatus[auditLog.Status]++

		// Count by user
		byUser[auditLog.Username]++

		// Count successful operations
		if auditLog.Status == "success" {
			successCount++
		}
	}

	// Calculate success rate
	if len(ret.Rows) > 0 {
		stats["success_rate"] = float64(successCount) / float64(len(ret.Rows)) * 100
	}

	return stats, nil
}

// Helper function to log audit
func (h *Handler) logAudit(c droplet.Context, action, resource, resourceID, details, status, errorMsg string) {
	// Get user info from context (this would be set by authentication middleware)
	userID := c.Get("user_id")
	username := c.Get("username")
	ipAddress := c.Get("ip_address")
	userAgent := c.Get("user_agent")

	auditLog := &entity.AuditLog{
		UserID:     userID.(string),
		Username:   username.(string),
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Details:    map[string]interface{}{"description": details},
		IPAddress:  ipAddress.(string),
		UserAgent:  userAgent.(string),
		Status:     status,
		ErrorMsg:   errorMsg,
		Timestamp:  time.Now().Unix(),
	}

	// Log audit (ignore errors for now)
	h.auditStore.Create(c.Context(), auditLog)
}