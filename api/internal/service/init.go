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

// InitializeDefaultData initializes default permissions, roles, role-permission assignments, and audit config
func InitializeDefaultData(ctx context.Context) error {
	log.Info("Initializing default permissions, roles, role-permission assignments, and audit config...")

	if err := initializeDefaultPermissions(ctx); err != nil {
		return err
	}

	if err := initializeDefaultRoles(ctx); err != nil {
		return err
	}

	if err := initializeDefaultRolePermissions(ctx); err != nil {
		return err
	}

	// Initialize audit configuration
	auditService := NewAuditService()
	if err := auditService.InitializeAuditConfig(ctx); err != nil {
		return err
	}

	log.Info("Default data initialization completed successfully")
	return nil
}

func initializeDefaultPermissions(ctx context.Context) error {
	permissionStore := store.GetStore(store.HubKeyPermission)

	for _, perm := range entity.DefaultPermissions {
		// Check if permission already exists
		existing, err := permissionStore.Get(ctx, perm.ID)
		if err == nil && existing != nil {
			continue // Permission already exists
		}

		// Create permission
		perm.CreateTime = time.Now().Unix()
		perm.UpdateTime = time.Now().Unix()
		_, err = permissionStore.Create(ctx, &perm)
		if err != nil {
			log.Errorf("Failed to create permission %s: %v", perm.ID, err)
			return err
		}
		log.Infof("Created permission: %s", perm.Name)
	}

	return nil
}

func initializeDefaultRoles(ctx context.Context) error {
	roleStore := store.GetStore(store.HubKeyRole)

	for _, role := range entity.DefaultRoles {
		roleID := role.ID.(string)
		// Check if role already exists
		existing, err := roleStore.Get(ctx, roleID)
		if err == nil && existing != nil {
			continue // Role already exists
		}

		// Create role
		role.CreateTime = time.Now().Unix()
		role.UpdateTime = time.Now().Unix()
		_, err = roleStore.Create(ctx, &role)
		if err != nil {
			log.Errorf("Failed to create role %s: %v", roleID, err)
			return err
		}
		log.Infof("Created role: %s", role.Name)
	}

	return nil
}

func initializeDefaultRolePermissions(ctx context.Context) error {
	rolePermissionStore := store.GetStore(store.HubKeyRolePermission)

	// Create role-permission assignments based on default roles
	for _, role := range entity.DefaultRoles {
		roleID := role.ID.(string)
		var permissionIDs []string
		switch roleID {
		case "admin":
			// Admin gets all permissions
			for _, perm := range entity.DefaultPermissions {
				permissionIDs = append(permissionIDs, perm.ID)
			}
		case "operator":
			// Operator gets read/write permissions but not admin permissions
			for _, perm := range entity.DefaultPermissions {
				if perm.Resource != "user" && perm.Resource != "role" {
					permissionIDs = append(permissionIDs, perm.ID)
				}
			}
		case "viewer":
			// Viewer gets only read permissions
			for _, perm := range entity.DefaultPermissions {
				if perm.Action == "read" {
					permissionIDs = append(permissionIDs, perm.ID)
				}
			}
		}

		for _, permID := range permissionIDs {
			rp := entity.RolePermission{
				RoleID:       roleID,
				PermissionID: permID,
				CreateTime:   time.Now().Unix(),
			}

			// Check if role-permission assignment already exists
			key := rp.RoleID + "_" + rp.PermissionID
			existing, err := rolePermissionStore.Get(ctx, key)
			if err == nil && existing != nil {
				continue // Assignment already exists
			}

			// Create role-permission assignment
			_, err = rolePermissionStore.Create(ctx, &rp)
			if err != nil {
				log.Errorf("Failed to assign permission %s to role %s: %v", rp.PermissionID, rp.RoleID, err)
				return err
			}
			log.Infof("Assigned permission %s to role %s", rp.PermissionID, rp.RoleID)
		}
	}

	return nil
}