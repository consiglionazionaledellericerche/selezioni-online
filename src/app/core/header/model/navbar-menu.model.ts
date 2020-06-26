import {Menu} from './menu.model';
import {Injector} from '@angular/core';

export class NavbarMenu {

  public evaluating: boolean = null;

  constructor(public menus: Menu[]) {}

  public getPaths(injector: Injector): string[] {
    const paths = [];
    this.menus.forEach(menu => {
      if (menu.path) {
        paths.push(menu.path);
      }
      menu.items.forEach( menuitem => {
        if (!menuitem.dependent) {
          // il path viene preso dal servizio ...
          menuitem.pathToCheck = injector.get(menuitem.name).getApiPath();
          paths.push(menuitem.pathToCheck);
        }
      });
    });
    return paths;
  }

  public evaluate(permittedPaths) {
    this.menus.forEach(menu => {
      if (menu.path) {
        menu.active = permittedPaths.includes(menu.path);
      }
      menu.items.forEach(item => {
        if (!item.dependent) {
          if (permittedPaths.includes(item.pathToCheck)) {
            item.active = true;
            if (item.depending) {
              item.depending.forEach(depending => {
                depending.active = true;
              });
            }
          }
        }
      });
    });
  }
}
