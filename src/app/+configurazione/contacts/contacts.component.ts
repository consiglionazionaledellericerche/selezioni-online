import {Component, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'contacts',
    templateUrl: './contacts.component.html'
})
export class ContactsComponent implements OnInit{
    public static ROUTE = 'contacts';
    public telefono: string;
    public fax: string;
    public email: string;
    public pec: string;
    
    constructor(private translateService: TranslateService) {}

    ngOnInit() {
        this.translateService.get(['contacts.telefono', 'contacts.fax', 'contacts.email', 'contacts.pec']).subscribe((label: any) => {
            this.telefono = label['contacts.telefono'];
            this.fax = label['contacts.fax'];
            this.email = label['contacts.email'];
            this.pec = label['contacts.pec'];
        });    
    }
}