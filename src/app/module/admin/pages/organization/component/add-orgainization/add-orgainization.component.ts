import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrgainizationService } from '../../../../../../_core/http/api/orginization.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-orgainization',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-orgainization.component.html',
})
export class AddOrgainizationComponent {
  public showModel = false;
  public isLoading = false;

  @Input() public customers: any;
  @Output() onClick = new EventEmitter();

  constructor(
    private readonly orgService: OrgainizationService,
    private readonly toaster: ToastrService,
  ) {}

  public orgForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    taxId: new FormControl('', Validators.required),
    isActive: new FormControl(true),
    createdAt: new FormControl(new Date()),
    addresses: new FormArray([this.createAddressGroup()]),
  });

  private createAddressGroup(): FormGroup {
    return new FormGroup({
      addressType: new FormControl('Mailing', Validators.required),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      country: new FormControl('USA', Validators.required),
      isDefault: new FormControl(true),
    });
  }

  get addresses(): FormArray {
    return this.orgForm.get('addresses') as FormArray;
  }

  public addAddress(): void {
    this.addresses.push(this.createAddressGroup());
  }

  public removeAddress(index: number): void {
    this.addresses.removeAt(index);
  }

  ngAfterViewInit() {}

  public modelData(isload: boolean) {
    this.onClick.emit(isload);
    this.orgForm.reset();
    this.orgForm.get('isActive')?.setValue(true);
    this.addresses.clear();
    this.addresses.push(this.createAddressGroup());
    this.isLoading = false;
  }

  public closeModel(isload: boolean) {
    this.modelData(isload);
  }

  public onSubmit() {
    this.isLoading = true;
    this.orgService.postOrganization(this.orgForm.value).subscribe({
      next: (response: any) => {
        this.modelData(true);
        this.toaster.success('Organization added successfully');
      },
      error: (error: any) => {
        this.modelData(true);
        this.toaster.error('Failed to add organization');
      },
    });
  }
}
