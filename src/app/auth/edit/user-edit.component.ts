import { Component, OnInit, Injector, ChangeDetectionStrategy } from '@angular/core';
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
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-user-edit',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        if (this.authService.isAuthenticated()) {
            this.setEntity(Helpers.buildInstance(this.authService.getUser(), User));
        } else {
            this.setEntity(new User());
        }
        this.buildCreateForm();
        super.ngOnInit();
    }
    
    // convenience getter for easy access to form fields
    get f() { return this.ngForm.controls; }

    public setEntity(entity: User) {
        this.entity = entity;
    }

    public buildUpdateForm(id: number, entity: User) {

    }
  
    public buildCreateForm() {
        const emailUnique = new UniqueFieldValidator(
            this.injector, 
            this.entity, 
            UserService, 
            'existingEmail', 
            'emailalredyexist'
        );
        const codicefisclaeUnique = new UniqueFieldValidator(
            this.injector, 
            this.entity, 
            UserService, 
            'existingCodicefiscale', 
            'codicefiscalealredyexist'
        );
        this.ngForm = this.formBuilder.group({
            firstName: [this.entity.firstName, Validators.required],
            lastName: [this.entity.lastName, Validators.required],
            email: [this.entity.getEmail(), 
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
            straniero: [ this.entity.straniero ? String(this.entity.straniero) : 'false', Validators.required],
            codicefiscale: [this.entity.codicefiscale, [Validators.required], [codicefisclaeUnique.validator.bind(codicefisclaeUnique)]],
            sesso: [ String(this.entity.sesso || 'M'), Validators.required],
            dataDiNascita: [this.entity.dataDiNascita ? new Date(this.entity.dataDiNascita): undefined, Validators.required],
            statoestero: [this.entity.statoestero, Validators.required],

        });
        this.manageNgForm(this.entity.straniero ? String(this.entity.straniero) : 'false');
        if (this.entity.userName) {
            this.ngForm.controls.confirmemail.disable();
            this.ngForm.controls.password.disable();
            this.ngForm.controls.confirmpassword.disable();
        }
        this.ngForm.controls.straniero.valueChanges.pipe(distinctUntilChanged()).subscribe(newValue => {
            this.manageNgForm(newValue);
        })
    }
  
    manageNgForm(newValue: string) {
        if (newValue == 'true'){
            this.ngForm.controls.codicefiscale.disable();
            this.ngForm.controls.sesso.enable();
            this.ngForm.controls.dataDiNascita.enable();
            this.ngForm.controls.statoestero.enable();
        } else {
            this.ngForm.controls.codicefiscale.enable();
            this.ngForm.controls.sesso.disable();
            this.ngForm.controls.dataDiNascita.disable();
            this.ngForm.controls.statoestero.disable();
        }
    }

    public buildInstance(): User {
        return null;
    };
  
    onSubmit() {
        this.submitted = true;
        Object.keys(this.ngForm.controls).forEach(control => {
            this.ngForm.controls[control].markAsDirty({onlySelf: true});
        });
        // stop here if form is invalid
        if (this.ngForm.invalid) {
            this.translateService.get('message.form.invalid').subscribe((label) => {
                this.apiMessageService.sendMessage(MessageType.WARNING, label);
            });
        }
    }
}
