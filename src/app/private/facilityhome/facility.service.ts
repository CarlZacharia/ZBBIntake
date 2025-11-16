import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FacilityProfile {
  providerName: string;
  facilityAddress: string;
  facilityCsz: string;
  facilityCounty: string;
  facilityContact: string;
  facilityEmail: string;
  facilityPhone: string;
}

@Injectable({ providedIn: 'root' })
export class FacilityService {
  private apiUrl = '/api/facilityprofile.php';

  constructor(private http: HttpClient) {}

  saveFacilityProfile(profile: FacilityProfile): Observable<any> {
    return this.http.post<any>(this.apiUrl, profile);
  }

  getFacilityProfile(): Observable<FacilityProfile> {
    return this.http.get<FacilityProfile>(this.apiUrl);
  }
}
