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

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EuiSidesheetService } from '@elemental-ui/core';
import { PortalRespTeamResponsibilities, ResponsibilitiesExtendedData, ResponsibilityData } from '@imx-modules/imx-api-qer';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection, ValType } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { BusyService, calculateSidesheetWidth, ClientPropertyForTableColumns, DataViewInitParameters, DataViewSource } from 'qbm';
import { TeamResponsibilitiesService } from './team-responsibilities.service';
import { TeamResponsibilityAssignSidesheetComponent } from './team-responsibility-assign-sidesheet/team-responsibility-assign-sidesheet.component';
import { TeamResponsibilityDialogComponent } from './team-responsibility-dialog/team-responsibility-dialog.component';
import { TeamResponsibilitySidesheetComponent } from './team-responsibility-sidesheet/team-responsibility-sidesheet.component';

@Component({
  selector: 'imx-team-responsibilities',
  templateUrl: './team-responsibilities.component.html',
  styleUrls: ['./team-responsibilities.component.scss'],
  providers: [DataViewSource],
})
export class TeamResponsibilitiesComponent implements OnInit {
  public entitySchema: EntitySchema;
  public busyService = new BusyService();
  public displayColumns: ClientPropertyForTableColumns[];
  public tableSelection: PortalRespTeamResponsibilities[] = [];
  public customFilterValue = true;

  constructor(
    private readonly teamResponsibilitiesService: TeamResponsibilitiesService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translateService: TranslateService,
    public dataSource: DataViewSource<PortalRespTeamResponsibilities, ResponsibilitiesExtendedData>,
    private readonly dialogService: MatDialog,
  ) {
    this.entitySchema = this.teamResponsibilitiesService.responsibilitySchema;
  }

  public async ngOnInit(): Promise<void> {
    this.setDisplayColumns();
    this.setupDataSource();
  }

  public isActionNeeded(responsibility: PortalRespTeamResponsibilities): boolean {
    return !!responsibility.ExitDate.value || responsibility.PersonIsInactive.value;
  }

  public identitiesCount(responsibility: PortalRespTeamResponsibilities): number {
    const extendedData = this.getExtendedData(responsibility);
    return 1 + (extendedData?.OtherIdentities || []).length;
  }
  public isResponsibilitiesDeletable(): boolean {
    return this.tableSelection.some((responsibility) => !!responsibility.UID_SourceColumn.value);
  }

  public onCustomFilterChange(): void {
    this.dataSource.selection.clear();
    this.dataSource.updateState();
  }

  public onOpenDetails(responsibility: PortalRespTeamResponsibilities): void {
    const extendedData = this.getExtendedData(responsibility);
    this.sideSheet
      .open(TeamResponsibilitySidesheetComponent, {
        title: this.translateService.instant('#LDS#Heading View Responsibility Details'),
        subTitle: responsibility.GetEntity().GetDisplayLong(),
        icon: 'info',
        padding: '0',
        width: calculateSidesheetWidth(600, 0.4),
        disableClose: false,
        testId: 'team-responsibilities-sidesheet',
        data: {
          extendedData,
          responsibility,
        },
      })
      .afterClosed()
      .subscribe((reload: boolean) => {
        if (reload) {
          this.dataSource.selection.clear();
          this.dataSource.updateState();
        }
      });
  }

  public onDeleteResponsibilities(): void {
    if (!!this.tableSelection.length) {
      this.dialogService
        .open(TeamResponsibilityDialogComponent, { data: this.tableSelection })
        .afterClosed()
        .subscribe(async (result) => {
          if (result) {
            await this.teamResponsibilitiesService.removeResponsibilities(this.tableSelection);
            this.dataSource.selection.clear();
            this.dataSource.updateState();
          }
        });
    }
  }

  public onReassignResponsibilities(): void {
    const responsibilities: PortalRespTeamResponsibilities[] = [];
    this.tableSelection.map((responsibility, index) => {
      if (responsibilities.every((resp) => resp.XObjectKey.value !== responsibility.XObjectKey.value)) {
        responsibilities.push(responsibility);
      }
    });
    const extendedData: (ResponsibilityData | undefined)[] = responsibilities.map((responsibility) => this.getExtendedData(responsibility));
    this.sideSheet
      .open(TeamResponsibilityAssignSidesheetComponent, {
        title: this.translateService.instant(
          responsibilities.length > 1 ? '#LDS#Heading Reassign Responsibilities' : '#LDS#Heading Reassign Responsibility',
        ),
        subTitle: responsibilities.length > 1 ? undefined : responsibilities[0].GetEntity().GetDisplay(),
        icon: 'forward',
        padding: '0',
        width: calculateSidesheetWidth(600, 0.4),
        testId: 'team-responsibilities-assign-sidesheet',
        data: { responsibility: responsibilities, reassign: true, extendedData },
      })
      .afterClosed()
      .subscribe((result: boolean) => {
        if (result) {
          this.dataSource.selection.clear();
          this.dataSource.updateState();
        }
      });
  }

  private async setupDataSource(): Promise<void> {
    let dataModel = await this.teamResponsibilitiesService.getDataModel();
    dataModel = { ...dataModel, Filters: dataModel.Filters?.filter((filter) => filter.Name !== 'forinactive') };
    this.dataSource.itemStatus = {
      enabled: (entity: PortalRespTeamResponsibilities) => !entity.UID_SourceColumn.value,
    };
    const dataViewInitParameters: DataViewInitParameters<PortalRespTeamResponsibilities> = {
      execute: (
        params: CollectionLoadParameters,
        signal: AbortSignal,
      ): Promise<ExtendedTypedEntityCollection<PortalRespTeamResponsibilities, ResponsibilitiesExtendedData>> =>
        this.teamResponsibilitiesService.get({ ...params, forinactive: this.customFilterValue ? '1' : undefined }, signal),
      schema: this.entitySchema,
      columnsToDisplay: this.displayColumns,
      dataModel,
      highlightEntity: (identity: PortalRespTeamResponsibilities) => {
        this.onOpenDetails(identity);
      },
      selectionChange: (selection: PortalRespTeamResponsibilities[]) => {
        this.tableSelection = selection;
      },
      groupExecute: (column, params, signal) => this.teamResponsibilitiesService.getGroups(column, params, signal),
    };
    this.dataSource.init(dataViewInitParameters);
  }

  private getExtendedData(responsibility: PortalRespTeamResponsibilities): ResponsibilityData | undefined {
    const index = this.dataSource?.data.indexOf(responsibility) ?? -1;
    const extendedData = this.dataSource.collectionData() as ExtendedTypedEntityCollection<
      PortalRespTeamResponsibilities,
      ResponsibilitiesExtendedData
    >;
    if (index > -1) {
      return extendedData.extendedData?.Data?.[index];
    }
  }

  private setDisplayColumns(): void {
    this.displayColumns = [
      this.entitySchema.Columns.DisplayName,
      this.entitySchema.Columns.ExitDate,
      {
        ColumnName: 'status',
        Type: ValType.String,
      },
      this.entitySchema.Columns.UID_Person,
      {
        ColumnName: 'identitiesCount',
        Type: ValType.String,
      },
    ];
  }
}
