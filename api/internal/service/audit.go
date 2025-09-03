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
package service

import (
	"context"
	"time"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/log"
)

// AuditService provides audit logging functionality
type AuditService struct {
	auditStore  store.Interface
	configStore store.Interface
}

// NewAuditService creates a new audit service instance
func NewAuditService() *AuditService {
	return &AuditService{
		auditStore:  store.GetStore(store.HubKeyAuditLog),
		configStore: store.GetStore(store.HubKeySystemConfig),
	}
}

// LogOperation logs a user operation
func (s *AuditService) LogOperation(ctx context.Context, userID, username, action, resource, resourceID string, details map[string]interface{}, ipAddress, userAgent, status, errorMsg string) error {
	// Check if audit is enabled
	if !s.IsAuditEnabled(ctx) {
		return nil
	}

	auditLog := &entity.AuditLog{
		UserID:     userID,
		Username:   username,
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Details:    details,
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
		Status:     status,
		ErrorMsg:   errorMsg,
		Timestamp:  time.Now().Unix(),
	}

	_, err := s.auditStore.Create(ctx, auditLog)
	if err != nil {
		log.Errorf("Failed to create audit log: %v", err)
		return err
	}

	return nil
}

// LogSuccess logs a successful operation
func (s *AuditService) LogSuccess(ctx context.Context, userID, username, action, resource, resourceID string, details map[string]interface{}, ipAddress, userAgent string) error {
	return s.LogOperation(ctx, userID, username, action, resource, resourceID, details, ipAddress, userAgent, "success", "")
}

// LogFailure logs a failed operation
func (s *AuditService) LogFailure(ctx context.Context, userID, username, action, resource, resourceID string, details map[string]interface{}, ipAddress, userAgent, errorMsg string) error {
	return s.LogOperation(ctx, userID, username, action, resource, resourceID, details, ipAddress, userAgent, "failed", errorMsg)
}

// IsAuditEnabled checks if audit logging is enabled
func (s *AuditService) IsAuditEnabled(ctx context.Context) bool {
	configData, err := s.configStore.Get(ctx, "audit_config")
	if err != nil {
		// Default to enabled if config not found
		return true
	}

	systemConfig := configData.(*entity.SystemConfig)
	if enabled, ok := systemConfig.Payload["enabled"].(bool); ok {
		return enabled
	}

	// Default to enabled
	return true
}

// GetRetentionDays gets the audit log retention period in days
func (s *AuditService) GetRetentionDays(ctx context.Context) int {
	configData, err := s.configStore.Get(ctx, "audit_config")
	if err != nil {
		// Default to 30 days
		return 30
	}

	systemConfig := configData.(*entity.SystemConfig)
	if retentionDays, ok := systemConfig.Payload["retention_days"].(float64); ok {
		return int(retentionDays)
	}

	// Default to 30 days
	return 30
}

// CleanupOldLogs removes audit logs older than the retention period
func (s *AuditService) CleanupOldLogs(ctx context.Context) error {
	retentionDays := s.GetRetentionDays(ctx)
	cutoffTime := time.Now().AddDate(0, 0, -retentionDays).Unix()

	// Get all audit logs older than cutoff time
	ret, err := s.auditStore.List(ctx, store.ListInput{
		Predicate: func(obj interface{}) bool {
			auditLog := obj.(*entity.AuditLog)
			return auditLog.Timestamp < cutoffTime
		},
	})

	if err != nil {
		log.Errorf("Failed to list old audit logs: %v", err)
		return err
	}

	// Delete old audit logs
	var deletedCount int
	for _, item := range ret.Rows {
		auditLog := item.(*entity.AuditLog)
		if err := s.auditStore.BatchDelete(ctx, []string{auditLog.ID.(string)}); err == nil {
			deletedCount++
		} else {
			log.Errorf("Failed to delete audit log %s: %v", auditLog.ID, err)
		}
	}

	log.Infof("Cleaned up %d old audit logs (older than %d days)", deletedCount, retentionDays)
	return nil
}

// InitializeAuditConfig initializes default audit configuration
func (s *AuditService) InitializeAuditConfig(ctx context.Context) error {
	// Check if audit config already exists
	_, err := s.configStore.Get(ctx, "audit_config")
	if err == nil {
		// Config already exists
		return nil
	}

	// Create default audit config
	systemConfig := &entity.SystemConfig{
		ConfigName: "audit_config",
		Desc:       "Default audit log configuration",
		Payload: map[string]interface{}{
			"retention_days": 30,
			"enabled":        true,
		},
		CreateTime: time.Now().Unix(),
		UpdateTime: time.Now().Unix(),
	}

	_, err = s.configStore.Create(ctx, systemConfig)
	if err != nil {
		log.Errorf("Failed to create default audit config: %v", err)
		return err
	}

	log.Info("Created default audit configuration")
	return nil
}

// GetAuditStats returns audit statistics for the specified period
func (s *AuditService) GetAuditStats(ctx context.Context, days int) (map[string]interface{}, error) {
	if days <= 0 {
		days = 7 // Default to 7 days
	}

	// Calculate start time
	startTime := time.Now().AddDate(0, 0, -days).Unix()

	// Get audit logs within the time range
	ret, err := s.auditStore.List(ctx, store.ListInput{
		Predicate: func(obj interface{}) bool {
			auditLog := obj.(*entity.AuditLog)
			return auditLog.Timestamp >= startTime
		},
	})

	if err != nil {
		return nil, err
	}

	// Calculate statistics
	stats := map[string]interface{}{
		"total_logs":    len(ret.Rows),
		"by_action":     make(map[string]int),
		"by_resource":   make(map[string]int),
		"by_status":     make(map[string]int),
		"by_user":       make(map[string]int),
		"success_rate":  0.0,
		"period_days":   days,
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