// edit-orgainization.component.ts

import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrgainizationService } from '../../../../../../_core/http/api/orginization.service';
import { DeleteModelComponent } from '../delete-model/delete-model.component';

@Component({
  selector: 'app-edit-orgainization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DeleteModelComponent],
  templateUrl: './edit-orgainization.component.html',
})
export class EditOrgainizationComponent implements OnInit, OnChanges {
  @Input() organization: any;

  @Output() saveSuccess = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  isSaving: boolean = false;
  isAddingAddress: boolean[] = [];

  constructor(private readonly orgService: OrgainizationService) {}

  public organizationForm: FormGroup = new FormGroup({
    organizationId: new FormControl(''),
    name: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    taxId: new FormControl(''),
    isActive: new FormControl(true),
    createdAt: new FormControl(new Date()),
    addresses: new FormArray([]),
  });

  private createAddressGroup(address?: any, isNew: boolean = false): FormGroup {
    return new FormGroup({
      addressId: new FormControl(address?.addressId || 0),
      organizationId: new FormControl(this.organization?.organizationId || 0),
      addressType: new FormControl(
        address?.addressType || '',
        Validators.required,
      ),
      addressLine1: new FormControl(
        address?.addressLine1 || '',
        Validators.required,
      ),
      addressLine2: new FormControl(address?.addressLine2 || ''),
      city: new FormControl(address?.city || '', Validators.required),
      state: new FormControl(address?.state || ''),
      postalCode: new FormControl(address?.postalCode || ''),
      country: new FormControl(address?.country || 'USA', Validators.required),
      isDefault: new FormControl(address?.isDefault || false),
      isNewAddress: new FormControl(isNew),
    });
  }

  ngOnInit(): void {
    if (this.organization) {
      this.populateForm(this.organization);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['organization'] && changes['organization'].currentValue) {
      this.populateForm(changes['organization'].currentValue);
    }
  }

  populateForm(org: any): void {
    if (!org) {
      return;
    }

    this.organizationForm.patchValue({
      organizationId: org.organizationId,
      name: org.name,
      type: org.type,
      email: org.email,
      phone: org.phone,
      taxId: org.taxId,
      isActive: org.isActive,
      createdAt: org.createdAt,
    });

    this.addresses.clear();
    org.addresses?.forEach((address: any) => {
      this.addresses.push(this.createAddressGroup(address, false));
    });

    this.isAddingAddress = new Array(this.addresses.length).fill(false);

    if (this.addresses.length === 0) {
      this.addAddress(false);
    }
  }

  get addresses(): FormArray {
    return this.organizationForm.get('addresses') as FormArray;
  }

  addAddress(isInitial: boolean = true): void {
    this.addresses.push(this.createAddressGroup(undefined, isInitial));
    this.isAddingAddress.push(false);
  }

  saveNewAddress(addressIndex: number): void {
    const addressGroup = this.addresses.at(addressIndex) as FormGroup;

    if (
      addressGroup.get('isNewAddress')?.value !== true ||
      addressGroup.invalid
    ) {
      addressGroup.markAllAsTouched();
      return;
    }

    const fullFormValue = addressGroup.value;

    const { addressId, isNewAddress, ...addressPayload } = fullFormValue;

    this.isAddingAddress[addressIndex] = true;

    this.orgService.addOrganizationAddress(addressPayload).subscribe({
      next: (response: any) => {
        addressGroup.patchValue({
          addressId: response.addressId,
          isNewAddress: false,
        });

        this.isAddingAddress[addressIndex] = false;
      },
      error: (error: any) => {
        this.isAddingAddress[addressIndex] = false;
      },
    });
  }

  public showDeleteModel: boolean = false;
  public addressId: any;
  public addressIndex: number = -1;
  public deleteAddress(addressIndex: number): void {
    this.addressIndex = addressIndex;
    const addressGroup = this.addresses.at(addressIndex) as FormGroup;
    this.addressId = addressGroup.get('addressId')?.value;
    this.showDeleteModel = true;
  }
  public closeDeleteAdress(event: any) {
    if (event) {
      this.showDeleteModel = !this.showDeleteModel;
      this.addresses.removeAt(this.addressIndex);
      this.isAddingAddress.splice(this.addressIndex, 1);
      if (this.addresses.length === 0) {
        this.addAddress(false);
      }
    } else {
      this.showDeleteModel = !this.showDeleteModel;
    }
  }

  public closeDeleteModel() {
    this.showDeleteModel = false;
  }

  onSubmit(): void {
    if (this.organizationForm.invalid) {
      this.organizationForm.markAllAsTouched();
      return;
    }

    const hasUnsavedAddress = this.addresses.controls.some(
      (group) => group.get('isNewAddress')?.value === true,
    );

    if (hasUnsavedAddress) {
      return;
    }

    this.isSaving = true;
    const formValue = this.organizationForm.value;

    this.orgService.updateOrganization(formValue).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.saveSuccess.emit(response);
      },
      error: (error: any) => {
        this.isSaving = false;
      },
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
