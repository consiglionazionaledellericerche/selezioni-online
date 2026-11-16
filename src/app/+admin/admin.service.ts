import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ConfigService } from '../core/config.service';
import { ApiMessageService, MessageType } from '../core/api-message.service';

export interface AuthorityAttr {
  id: string;
  type: 'GROUP' | 'USER';
  shortName: string;
  fullName: string;
  displayName: string;
  authorityId: string;
  allowableActions: string[];
}

export interface Authority {
  attr: AuthorityAttr;
  data: string;
}

export interface Permission {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  list: 'whitelist' | 'blacklist';
  type: 'all' | 'group' | 'user';
  authority?: string;
}

export type CacheName = 'bulkinfo' | 'application' | 'call' | 'jasper' | 'sedi' | 'labels' | 'types' | 'all';

/**
 * Client delle API /openapi/v1/admin di cool-jconon.
 */
@Injectable()
export class AdminService {

  public static URL = '/v1/admin';

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService,
    private apiMessageService: ApiMessageService
  ) {}

  /* Gruppi e gestori */

  groupsRoot(): Observable<any> {
    return this.get('/groups/root');
  }

  groupChildren(fullName?: string, zones?: string): Observable<Authority[]> {
    return this.get('/groups/children', this.params({fullName, zones}));
  }

  searchGroups(filter: string): Observable<{groups: {authorityName: string, authorityDisplayName: string, nodeRef: string}[]}> {
    return this.get('/groups/search', this.params({filter, maxItems: '50'}));
  }

  groupMembers(groupName: string): Observable<string[]> {
    return this.get('/groups/members', this.params({groupName}));
  }

  groupMetadata(nodeRef: string): Observable<any> {
    return this.get('/groups/metadata', this.params({nodeRef}));
  }

  saveGroup(group: any): Observable<any> {
    return this.call(apiBase => this.httpClient.post(apiBase + AdminService.URL + '/groups', group));
  }

  saveGestori(group: any): Observable<any> {
    return this.call(apiBase => this.httpClient.post(apiBase + AdminService.URL + '/gestori', group));
  }

  deleteGroup(groupName: string, cascade = false): Observable<any> {
    return this.call(apiBase => this.httpClient.delete(apiBase + AdminService.URL + '/groups',
      {params: this.params({groupName, cascade: String(cascade)})}));
  }

  addGroupChild(parentGroupName: string, childName: string): Observable<any> {
    return this.call(apiBase => this.httpClient.post(apiBase + AdminService.URL + '/groups/children',
      {parent_group_name: parentGroupName, child_name: childName}));
  }

  removeGroupChild(parentNodeRef: string, childFullName: string): Observable<any> {
    return this.call(apiBase => this.httpClient.delete(apiBase + AdminService.URL + '/groups/children',
      {params: this.params({parentNodeRef, childFullName})}));
  }

  /* Utenti */

  searchUsers(filters: {[key: string]: any}): Observable<{people: any[]}> {
    return this.get('/users', this.params(filters));
  }

  user(userName: string): Observable<any> {
    return this.get('/users/' + encodeURIComponent(userName));
  }

  userGroups(userName: string): Observable<{groups: {itemName: string, displayName: string}[]}> {
    return this.get('/users/' + encodeURIComponent(userName) + '/groups');
  }

  updateUser(userName: string, user: any): Observable<any> {
    return this.call(apiBase => this.httpClient.put(apiBase + AdminService.URL + '/users/' + encodeURIComponent(userName), user));
  }

  deleteUser(userName: string): Observable<any> {
    return this.call(apiBase => this.httpClient.delete(apiBase + AdminService.URL + '/users/' + encodeURIComponent(userName)));
  }

  setUserEnabled(userName: string, enabled: boolean): Observable<{enabled: boolean}> {
    return this.call(apiBase => this.httpClient.post<{enabled: boolean}>(
      apiBase + AdminService.URL + '/users/' + encodeURIComponent(userName) + '/enabled', null,
      {params: this.params({enabled: String(enabled)})}));
  }

  /* RBAC */

  rbac(): Observable<any> {
    return this.get('/rbac');
  }

  addPermission(permission: Permission): Observable<any> {
    return this.call(apiBase => this.httpClient.post(apiBase + AdminService.URL + '/rbac', permission));
  }

  deletePermission(permission: Permission): Observable<any> {
    return this.call(apiBase => this.httpClient.delete(apiBase + AdminService.URL + '/rbac',
      {params: this.params(permission as any)}));
  }

  /* Cache */

  resetCache(name: CacheName): Observable<any> {
    return this.call(apiBase => this.httpClient.post(apiBase + AdminService.URL + '/cache/reset/' + name, null));
  }

  /* Ispettore viste */

  typesTree(): Observable<any[]> {
    return this.get('/types-tree');
  }

  bulkInfo(type: string, kind: string, name = 'all'): Observable<any> {
    // un tipo puo' non definire tutte le viste: l'errore viene gestito dal chiamante senza notifica
    return this.call(apiBase => this.httpClient.get(apiBase + AdminService.URL + '/bulkinfo/' + kind + '/' +
      encodeURIComponent(name), {params: this.params({type})}), false);
  }

  /* Console JS */

  jsConsole(command: string): Observable<{error?: string, logs?: string[], output?: {content: any}}> {
    return this.call(apiBase => this.httpClient.post<any>(apiBase + AdminService.URL + '/js-console', {command}), false);
  }

  /* ---------------------------------------------------------------- */

  private get<T = any>(path: string, params?: HttpParams): Observable<T> {
    return this.call(apiBase => this.httpClient.get<T>(apiBase + AdminService.URL + path, {params}));
  }

  private call<T>(request: (apiBase: string) => Observable<T>, notify = true): Observable<T> {
    return this.configService.getApiBase().pipe(
      switchMap(apiBase => request(apiBase)),
      catchError((error: HttpErrorResponse) => {
        const message = error.status === 403 ? 'admin.error.forbidden' :
          (error.error && (error.error.message || error.error.error)) || 'admin.error.generic';
        if (notify) {
          this.apiMessageService.sendMessage(MessageType.ERROR, message);
        }
        return throwError(message);
      })
    );
  }

  private params(values: {[key: string]: any}): HttpParams {
    let params = new HttpParams();
    Object.keys(values || {})
      .filter(key => values[key] !== undefined && values[key] !== null && values[key] !== '')
      .forEach(key => params = params.set(key, String(values[key])));
    return params;
  }
}
