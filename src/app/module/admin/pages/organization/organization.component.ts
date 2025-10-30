// organization.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Ensure the path is correct for your components
import { AddOrgainizationComponent } from './component/add-orgainization/add-orgainization.component';
import { OrgainizationService } from '../../../../_core/http/api/orginization.service';
import { EditOrgainizationComponent } from './component/edit-orgainization/edit-orgainization.component';

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
  constructor(private readonly orgService: OrgainizationService) {}

  public organizations: any = [];
  public showAddOrganization: boolean = false;
  public organizationToEdit: any = null;

  ngOnInit(): void {
    this.getOrganizations();
  }

  public getOrganizations(): void {
    this.orgService.getOrganization().subscribe({
      next: (response: any) => {
        this.organizations = response;
      },
      error: (error: any) => {},
    });
  }

  public addOrganization(isLoad: boolean): void {
    if (isLoad) {
      this.getOrganizations();
      this.showAddOrganization = !this.showAddOrganization;
    }
    {
      this.showAddOrganization = !this.showAddOrganization;
    }
  }

  public openEditModal(org: any): void {
    this.organizationToEdit = org;
  }

  public onOrganizationUpdate(updatedOrg: any): void {
    if (updatedOrg) {
      this.organizationToEdit = null;
      this.getOrganizations();
    } else {
      this.organizationToEdit = null;
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
    if (this.orgId !== 0) {
      this.orgService.deleteOrganization(this.orgId).subscribe({
        next: (response: any) => {
          this.isDeleteModel = !this.isDeleteModel;
          this.getOrganizations();
        },
        error: (error: any) => {
          this.isDeleteModel = !this.isDeleteModel;
        },
      });
    }
  }
}
