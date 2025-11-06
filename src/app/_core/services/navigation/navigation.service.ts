import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor() {}

  public showSideNavigation$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  public getShowSideNavigation(): Observable<boolean> {
    return this.showSideNavigation$.asObservable();
  }

  public toggleSideNavigation(): void {
    this.showSideNavigation$.next(!this.showSideNavigation$.value);
  }
}
