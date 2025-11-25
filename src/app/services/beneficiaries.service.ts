import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BeneficiariesService {
  constructor(private http: HttpClient) {}

  getClientData(): Observable<any> {
    return this.http.get<any>('/api/clientdata');
  }

  getChildren(): Observable<any[]> {
    return this.getClientData().pipe(
      map((data: any) => data.children || [])
    );
  }

  getFamilyMembers(): Observable<any[]> {
    return this.getClientData().pipe(
      map((data: any) => data.family_members || [])
    );
  }

  getCharities(): Observable<any[]> {
    return this.getClientData().pipe(
      map((data: any) => data.charities || [])
    );
  }

  // Add create, update, delete methods for each type as needed
}
