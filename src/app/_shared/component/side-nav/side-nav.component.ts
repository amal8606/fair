import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent {
  constructor(private readonly route: Router) {}
  @Output() onClick = new EventEmitter();
  public closeNavbar() {
    this.onClick.emit();
  }

  public navigateTo(path: string) {
    const routePath = path === '' ? ['admin'] : ['admin', path];
    this.route.navigate(routePath);

    this.onClick.emit();
  }

  public logOut() {
    localStorage.clear();
    this.route.navigate(['/login']);
  }

  public showDealSubmenu = false;
}
