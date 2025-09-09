import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { PoService } from '../../../../_core/http/api/po.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-po',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-po.component.html',
})
export class AddPoComponent {
  public showModel = false;
  public isLoading = false;
  public newTagName = '';

  @Input() public customers: any;
  @Output() onClick = new EventEmitter();

  constructor(
    private readonly poService: PoService // private readonly tostersService: ToastrService
  ) {}
  public formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  public date = new Date();
  public poForm: FormGroup = new FormGroup({
    customerId: new FormControl(null, Validators.required),
    poNumber: new FormControl('', Validators.required),
    orderDate: new FormControl(this.formatDate(this.date), Validators.required),
    createdBy: new FormControl('1', Validators.required),
    modeOfShipment: new FormControl('', Validators.required),
    totalAmount: new FormControl(null, Validators.required),
    totalCost: new FormControl(null, Validators.required),
    description: new FormControl('', Validators.required),
    active: new FormControl(1, Validators.required),
  });

  ngAfterViewInit() {
    this.poForm.get('createdBy')?.setValue('1');
    this.poForm.get('active')?.setValue(1);
  }

  public modelData() {
    this.onClick.emit();
    this.poForm.reset();
    this.poForm.get('createdBy')?.setValue('1');
    this.poForm.get('active')?.setValue(1);
    this.isLoading = false;
  }
  public closeModel() {
    this.modelData();
  }

  public onSubmit() {
    this.isLoading = true;
    this.poService.createPO(this.poForm.value).subscribe({
      next: (response) => {
        this.modelData();
      },
      error: (error) => {
        this.modelData();
      },
    });
  }
}
