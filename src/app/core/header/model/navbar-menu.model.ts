import {Menu} from './menu.model';
import {Injector} from '@angular/core';

export class NavbarMenu {

  public evaluating: boolean = null;

  constructor(public menus: Menu[]) {}

  public getPaths(injector: Injector): any[] {
    const paths = [];
    this.menus.forEach(menu => {
      if (menu.path) {
        paths.push({path: menu.path, method: menu.method});      
      }
      if (menu.items) {
        menu.items.forEach( menuitem => {
          if (!menuitem.dependent) {
            paths.push({path: menuitem.pathToCheck, method: menuitem.method});
          }
        });  
      }
    });
    return paths;
  }

  public evaluate(permittedPaths) {
    this.menus.forEach(menu => {
      if (menu.path) {
        menu.active = permittedPaths.includes(menu.path);
      }
      if (menu.items) {
        menu.items.forEach(item => {
          if (!item.dependent) {
            if (permittedPaths.includes(item.pathToCheck)) {
              item.active = true;
              menu.active = true;
              if (item.depending) {
                item.depending.forEach(depending => {
                  depending.active = true;
                });
              }
            }
          }
        });
      }
    });
  }
}
