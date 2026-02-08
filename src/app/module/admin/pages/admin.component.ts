import { Component, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PoModelComponent } from '../component/po-model/po-model.component';
import { AddPoComponent } from '../component/add-po/add-po.component';
import { SideNavComponent } from '../../../_shared/component/side-nav/side-nav.component';
import { PoService } from '../../../_core/http/api/po.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatTableModule,
    MatSortModule,
    SideNavComponent,
  ],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  constructor(private readonly route: Router) {}
  public showSideNav = false;
  openMoreOptions(): void {
    this.showSideNav = true;
  }

  public navigateTo(path: string) {
    const routePath = path === '' ? ['admin'] : ['admin', path];
    this.route.navigate(routePath);
  }
}
