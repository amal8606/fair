import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { PoService } from '../../../../_core/http/api/po.service';

@Component({
  selector: 'app-po-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './po-model.component.html',
})
export class PoModelComponent {
  public showModel = false;
  public newTagName = '';

  @Output() onClick = new EventEmitter();
  @Input() public po: any;

  constructor(private readonly poService: PoService) {}

  public productItems: any;
  public subTotal: any;
  public total: any;
  public loading = false;

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

  onSubmit() {}
}
