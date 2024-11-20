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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { CdrModule, ExtModule } from 'qbm';

import { OwnerControlModule } from '../../owner-control/owner-control.module';
import { ServiceItemsEditFormComponent } from './service-items-edit-form.component';
import { ServiceItemTagsModule } from '../../service-item-tags/service-item-tags.module';

@NgModule({
  declarations: [ServiceItemsEditFormComponent],
  imports: [
    CommonModule,
    CdrModule,
    EuiCoreModule,
    EuiMaterialModule,
    ExtModule,
    OwnerControlModule,
    ReactiveFormsModule,
    ServiceItemTagsModule,
    TranslateModule,
  ],
  exports: [ServiceItemsEditFormComponent],
})
export class ServiceItemsEditFormModule {}
