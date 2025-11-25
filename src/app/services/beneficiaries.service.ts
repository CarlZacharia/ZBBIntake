import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BeneficiariesService {
  constructor(private http: HttpClient) {}

  getChildren(): Observable<any[]> {
    return this.http.get<any[]>('/api/children');
  }

  getFamilyMembers(): Observable<any[]> {
    return this.http.get<any[]>('/api/family_members');
  }

  getCharities(): Observable<any[]> {
    return this.http.get<any[]>('/api/charities');
  }

  // Add create, update, delete methods for each type as needed
}
