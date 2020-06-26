import {Enum} from '../../common/model/enum.model';


export class Profile extends Enum{

  constructor(protected value: string) {
    super(value);
  }

  public static values(): Profile[] {
    return [
      new Profile('Operatore di Amministrazione VIII livello'),
      new Profile('Operatore di Amministrazione VII livello'),
      new Profile('Operatore Tecnico VIII livello'),
      new Profile('Operatore Tecnico VII livello'),
      new Profile('Operatore Tecnico VI livello'),
      new Profile('Collaboratore di Amministrazione VII livello'),
      new Profile('Collaboratore di Amministrazione VI livello'),
      new Profile('Collaboratore di Amministrazione V livello'),
      new Profile('Collaboratore tecnico enti di ricerca VI livello'),
      new Profile('Collaboratore tecnico enti di ricerca V livello'),
      new Profile('Collaboratore tecnico enti di ricerca IV livello'),
      new Profile('Funzionario di Amministrazione V livello'),
      new Profile('Funzionario di Amministrazione IV livello'),
      new Profile('Ricercatore III livello'),
      new Profile('Tecnologo III livello'),
      new Profile('I Ricercatore II livello'),
      new Profile('I Tecnologo II livello'),
      new Profile('Dirigente di Ricerca I livello'),
      new Profile('Dirigente Tecnologo I livello'),
      new Profile('Ricercatore/Tecnologo'),
      new Profile('Dirigente II Fascia'),
      new Profile('Livelli IV-VIII'),
      new Profile('Livelli IV-VII'),
      new Profile('Componente Consiglio di Amministrazione')
    ];
  }

}
