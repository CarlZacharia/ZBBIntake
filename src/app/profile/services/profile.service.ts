// profile.service.ts (sketch)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) { }
  loadAll() {
    return this.http.get<any>('/api/profile/me/overview').pipe(
      map(r => ({
        profile: r.profile,
        nextEvent: r.nextEvent,
        milestones: r.milestones,
        todos: r.todos,
        education: r.education,
        threads: r.threads,
        vault: r.vault,
        scenarios: r.scenarios,
        activity: r.activity,
        funding: r.funding,
        miniMapUrl: r.miniMapUrl,
        notes: r.notes,
      }))
    );
  }
}
