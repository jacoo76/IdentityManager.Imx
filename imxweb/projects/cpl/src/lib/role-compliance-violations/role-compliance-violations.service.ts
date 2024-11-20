/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2024 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { RoleComplianceViolations } from '@imx-modules/imx-api-cpl';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class RoleComplianceViolationsService {
  private busyIndicator: OverlayRef | undefined;
  constructor(
    private apiservice: ApiService,
    private busyService: EuiLoadingService,
  ) {}

  public async getRoleComplianceViolations(table: string, uidRole: string): Promise<RoleComplianceViolations> {
    return this.apiservice.client.portal_roles_config_compliance_get(table, uidRole);
  }

  public handleOpenLoader(): void {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
  }

  public handleCloseLoader(): void {
    this.busyService.hide();
  }
}
