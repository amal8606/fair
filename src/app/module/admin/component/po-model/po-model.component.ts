import { CommonModule } from '@angular/common';
import { FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { PoService } from '../../../../_core/http/api/po.service';
import { MatButton } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import {
  ProgressBarMode,
  MatProgressBarModule,
} from '@angular/material/progress-bar';
import {MatRadioModule} from '@angular/material/radio'

@Component({
  selector: 'app-po-model',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButton,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatRadioModule
  ],
  templateUrl: './po-model.component.html',
})
export class PoModelComponent {
  public showModel = false;
  public newTagName = '';

  @Output() onClick = new EventEmitter();
  @Input() public po: any;

  constructor(
    private readonly poService: PoService,
    private readonly toaster: ToastrService
  ) {}
  public addItemModel: boolean = false;
  public productItems: any;
  public subTotal: any;
  public total: any;
  public loading = false;
  public createPOItemloading = false;
  public editingIndex: number | null = null;
  public addPOItemForm: FormGroup = new FormGroup({
    description: new FormControl('', Validators.required),
    quantity: new FormControl('', Validators.required),
    unitPrice: new FormControl('', Validators.required),
    traceabilityRequirement: new FormControl(''),
    totalPrice: new FormControl(''),
    unit: new FormControl('', Validators.required),
    poId: new FormControl(''),
    ManufacturerModel: new FormControl('', Validators.required),
    PartNumber: new FormControl('', Validators.required),
    ActualCostPerUnit: new FormControl(null, Validators.required),
  });
  editItem(index: number) {
    this.editingIndex = index;
  }

  cancelEdit() {
    this.editingIndex = null;
  }

  // Save PO details
  savePoDetails(po: any) {
    this.poService.updatePOItem(po).subscribe({
      next: () => {
        this.toaster.success('PO details updated successfully', 'Success');
        this.getPO();
        // Optionally show a success message
      },
      error: () => {
        this.toaster.error('Failed to update PO details', 'Error');
        // Optionally show an error message
      },
    });
  }

  // Save a line item
  saveItem(item: any) {
    this.poService.updatePOItem(item).subscribe({
      next: () => {
        this.toaster.success('PO details updated successfully', 'Success');
        this.getPO();
      },
      error: () => {
        this.toaster.error('Failed to update PO details', 'Error');
        // Optionally show an error message
      },
    });
  }

  // Delete a line item
  deleteItem(item: any) {
    // this.poService.deletePOItem(item.id).subscribe({
    //   next: () => {
    //     // Remove from po.items array
    //     this.po.items = this.po.items.filter((i: any) => i.id !== item.id);
    //   },
    //   error: () => {
    //     // Optionally show an error message
    //   }
    // });
  }
  ngOnInit() {
    this.getPO();
  }

  public getPO() {
    this.loading = true;
    this.poService.getPO(this.po.id).subscribe({
      next: (response) => {
        this.loading = false;
        this.productItems = response;
        this.subTotal = this.productItems.reduce(
          (acc: number, item: any) => acc + item.totalPrice,
          0
        );
        this.total = this.subTotal;
        console.log(this.productItems);
      },
      error: (error) => {
        console.log(error);
        if (error.status === 404) {
          this.productItems = [];
        }
        this.loading = false;
      },
    });
  }

  public closeModel() {
    this.onClick.emit();
  }

  onSubmit() {
    this.createPOItemloading = true;
    this.addPOItemForm.patchValue({
      poId: this.po.id,
      totalPrice:
        this.addPOItemForm.value.quantity * this.addPOItemForm.value.unitPrice,
    });
    this.poService.createPOItem(this.addPOItemForm.value).subscribe({
      next: (response) => {
        this.toaster.success('PO Item added successfully', 'Success');
        this.getPO();
        this.addItemModel = false;
        this.addPOItemForm.reset();
      },
      error: (error) => {
        this.toaster.error('Failed to add PO Item', 'Error');
        this.createPOItemloading = false;
      },
      complete: () => {
        this.createPOItemloading = false;
      },
    });
  }
}
