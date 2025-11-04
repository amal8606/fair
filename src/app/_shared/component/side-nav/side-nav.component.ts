import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../../../_core/services/navigation/navigation.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent {
  constructor(
    private readonly route: Router,
    private readonly navigationService: NavigationService
  ) {}
  @Output() onClick = new EventEmitter();
  public closeNavbar() {
    this.onClick.emit();
  }

  public navigateTo(path: string) {
    const routePath = path === '' ? ['admin'] : ['admin', path];
    this.route.navigate(routePath);

    this.onClick.emit();
  }

  public showMenuInvoice: boolean = false;

  public toggleMenuReports(): void {
    this.showMenuInvoice = !this.showMenuInvoice;
  }
  // public toggleSideNavigation(): void {
  //   this.navigationService.toggleSideNavigation();
  // }
  public logOut() {
    localStorage.clear();
    this.route.navigate(['/login']);
  }

  public showDealSubmenu = false;
}
