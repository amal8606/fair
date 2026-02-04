// organization.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Ensure the path is correct for your components
import { AddOrgainizationComponent } from './component/add-orgainization/add-orgainization.component';
import { OrgainizationService } from '../../../../_core/http/api/orginization.service';
import { EditOrgainizationComponent } from './component/edit-orgainization/edit-orgainization.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EditOrgainizationComponent,
    AddOrgainizationComponent,
  ],
  templateUrl: './organization.component.html',
})
export class OrganizationComponent implements OnInit {
  constructor(
    private readonly orgService: OrgainizationService,
    private readonly toaster: ToastrService,
  ) {}

  public organizations: any = [];
  public showAddOrganization: boolean = false;
  public organizationToEdit: any = null;

  ngOnInit(): void {
    this.getOrganizations();
  }
  public isLoading: boolean = false;
  public getOrganizations(): void {
    this.isLoading = true;
    this.orgService.getOrganization().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.organizations = response;
      },
      error: (error: any) => {},
    });
  }

  public addOrganization(isLoad: boolean): void {
    if (isLoad) {
      this.getOrganizations();
      this.showAddOrganization = false;
    }
    {
      this.showAddOrganization = false;
    }
  }

  public openEditModal(org: any): void {
    this.openEditModel = true;
    this.organizationToEdit = org;
  }

  openEditModel: boolean = false;
  public onOrganizationUpdate(updatedOrg: any): void {
    if (updatedOrg) {
      this.openEditModel = false;
      this.getOrganizations();
    } else {
      this.openEditModel = false;
    }
  }
  public isDeleteModel: boolean = false;
  public orgId: any;
  public deleteOrganization(orgId: any): void {
    this.orgId = orgId;
    this.isDeleteModel = !this.isDeleteModel;
  }
  public onCancel(): void {
    this.isDeleteModel = !this.isDeleteModel;
  }
  public isDeleting: boolean = false;
  onDeleteConfirm(): void {
    this.isDeleting = true;
    if (this.orgId !== 0) {
      this.orgService.deleteOrganization(this.orgId).subscribe({
        next: (response: any) => {
          this.isDeleteModel = !this.isDeleteModel;
          this.getOrganizations();
          this.toaster.success('Organization deleted successfully');
        },
        error: (error: any) => {
          this.isDeleteModel = !this.isDeleteModel;
          this.toaster.error('Error deleting organization');
        },
      });
    }
  }
}
