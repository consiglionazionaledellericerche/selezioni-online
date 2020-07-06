import { Component, OnInit, Injector } from '@angular/core';
import { NgForm, FormGroup, FormBuilder, Validators, NG_VALIDATORS } from '@angular/forms';

import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Helpers } from '../../common/helpers/helpers';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { TranslateService } from '@ngx-translate/core';
import { UniqueFieldValidator } from '../../common/validation/uniquefield-validator.model';
import { User } from '../model/user.model';
import { UserService } from './user.service';
import {RxwebValidators} from '@rxweb/reactive-form-validators';
import { CommonEditComponent } from '../../common/controller/common-edit.component';

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html'
})
export class UserEditComponent extends CommonEditComponent<User> implements OnInit{

    ngForm: FormGroup;
    submitted = false;

    constructor(private formBuilder: FormBuilder,
                private apiMessageService: ApiMessageService,
                private userService: UserService,
                protected route: ActivatedRoute,
                private translateService: TranslateService,
                private injector: Injector,
                private authService: AuthService, 
                protected router: Router) {
        super(userService, router, route);                
    }

    ngOnInit() {
        const emailUnique = new UniqueFieldValidator(this.injector, this.entity, UserService, 'existingEmail', 'emailalredyexist');
        const codicefisclaeUnique = new UniqueFieldValidator(this.injector, this.entity, UserService, 'existingCodicefiscale');
        this.ngForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', 
                [Validators.email,Validators.required], 
                [emailUnique.validator.bind(emailUnique)] 
            ],
            confirmemail: ['', [Validators.required, Validators.email, RxwebValidators.compare({fieldName:'email' })]],
            password: ['', [
                    Validators.required, 
                    Helpers.patternValidator(/\d/, { hasNumber: true }),
                    Helpers.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
                    Helpers.patternValidator(/[a-z]/, { hasSmallCase: true }),
                    Helpers.minlengthValidator(8, {minlength8: true})
                ]
            ],
            confirmpassword: ['', [Validators.required, RxwebValidators.compare({fieldName:'password' })]],
            cittadinanza: ['italy', Validators.required],
            codicefiscale: ['', Validators.required],
        });
    }
    
    // convenience getter for easy access to form fields
    get f() { return this.ngForm.controls; }

    public setEntity(entity: User) {
        this.entity = entity;
    }

    public buildUpdateForm(id: number, entity: User) {

    }
  
    public buildCreateForm() {

    }
  
    public buildInstance(): User {
        return null;
    };
  

    onSubmit() {
        this.submitted = true;
        console.log(this.ngForm.value);
        // stop here if form is invalid
        if (this.ngForm.invalid) {
            this.translateService.get('message.form.invalid').subscribe((label) => {
                this.apiMessageService.sendMessage(MessageType.WARNING, label);
            });
        }
    }
}
