import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PoService } from './_core/http/api/po.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'fairMount';
constructor(private readonly router:Router){

}

  showSideNav = false;
  openMoreOptions(): void {
    this.showSideNav = true;
  }
  ngOnInit(): void {
}
}
