import { Component } from '@angular/core';
import { InvoiceService } from '../../../../../_core/http/api/invoice.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoiced-pro-forma',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './invoiced-pro-forma.component.html',
})
export class InvoicedProFormaComponent {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly toastrService: ToastrService
  ) {}

  public endDate = new Date();
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  public startDate = new Date(this.endDate);
  public defaultStartDate = this.startDate.setDate(this.endDate.getDate() - 7);
  proFormaForm: FormGroup = new FormGroup({
    startDate: new FormControl(
      this.formatDate(this.startDate),
      Validators.required
    ),
    endDate: new FormControl(
      this.formatDate(this.endDate),
      Validators.required
    ),
  });

  public invoices: any;
  public isLoading: boolean = false;
  ngOnInit(): void {
    this.getInoicedProForma();
  }

  getInoicedProForma() {
    const { startDate, endDate } = this.proFormaForm.value;
    this.isLoading = true;
    this.invoiceService.getProFormaInvoiceData(startDate, endDate).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastrService.success('Invoiced Pro Forma fetched successfully');
        this.invoices = res;
      },
      error: (err) => {},
    });
  }
}
