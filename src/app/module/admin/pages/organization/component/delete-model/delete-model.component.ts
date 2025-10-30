// delete-model.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Need CommonModule for *ngIf
import { OrgainizationService } from '../../../../../../_core/http/api/orginization.service';

@Component({
  selector: 'app-delete-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-model.component.html',
})
export class DeleteModelComponent {
  @Input() addressId: number | null = null; // ID of the address to delete
  @Output() onClick = new EventEmitter();

  constructor(private readonly orgService: OrgainizationService) {}
  public isDeleting: boolean = false;
  onConfirm(): void {
    this.isDeleting = true;
    if (this.addressId !== 0) {
      this.orgService.deleteOrganizationAddress(this.addressId).subscribe({
        next: (response: any) => {
          this.onClick.emit(true);
          this.isDeleting = false;
        },
        error: (error: any) => {
          this.isDeleting = false;

          this.onClick.emit(false);
        },
      });
    }
  }

  onCancel(): void {
    this.onClick.emit(false);
  }
}
