import {Component} from '@angular/core';

@Component({
  standalone: false,
    selector: 'app-bad-request',
    template: `
        <div class="alert alert-warning text-center" role="alert">
            <i class="fa fa-2x fa-frown-o" aria-hidden="true"></i> Qualcosa è andato storto!
        </div>
    `
})
export class BadRequestComponent {


}
