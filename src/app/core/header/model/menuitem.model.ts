export class MenuItem {

  public active = false;                    // l'item sarà visibile
  public dependent = false;                // l'item dipende da altri item

  constructor(public name: string,
              public icon: string,
              public path: string,
              public label: string,
              public method: string = 'GET',
              public pathToCheck: string = undefined,
              public depending?: MenuItem[],
              public queryParams: any = []) {}
}
