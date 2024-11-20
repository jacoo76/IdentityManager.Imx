import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'imx-team-responsibility-status-dialog',
  templateUrl: './team-responsibility-status-dialog.component.html',
  styleUrl: './team-responsibility-status-dialog.component.scss',
})
export class TeamResponsibilityStatusDialogComponent {
  public shoppingCartInfo =
    '#LDS#{0} assignments have been successfully removed. {0} assignments have been added to your shopping cart. To complete the process, submit your shopping cart.';

  constructor(
    public dialogRef: MatDialogRef<TeamResponsibilityStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reassignedResponsibilities: number; cartResponsibilities: number },
  ) {}
}
