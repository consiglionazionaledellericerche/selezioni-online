import {CmisObject} from './cmisobject.model';

export class Legend {

  constructor(public icon: string,  public entity: CmisObject) {}

  private static handleNode(node, map: Map<number, Legend>) {
    if (node.entity && !map.get(node.entity.tipo.getId())) {
      map.set(node.entity.tipo.getId(), new Legend('cube', node.entity.tipo));
    }
    node.getChildren().forEach( (child) => this.handleNode(child, map));
  }


}
