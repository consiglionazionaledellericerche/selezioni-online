import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styles: [
        '.field-icon {float: right; right: 6px;margin-top: 10px;position: absolute;z-index: 100;}'    
    ]
})
export class SigninComponent implements OnInit{

    ngForm: FormGroup;
    submitted = false;

    constructor(private formBuilder: FormBuilder,
                private authService: AuthService, 
                private router: Router) { }

    ngOnInit() {
        this.ngForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }
    // convenience getter for easy access to form fields
    get f() { return this.ngForm.controls; }

    onSignin() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.ngForm.invalid) {
            return;
        }
        const username = this.ngForm.value.username;
        const password = this.ngForm.value.password;
        this.authService.signinUser(username, password).subscribe(
            (response) => {
                const { redirect } = window.history.state;
                this.router.navigateByUrl(redirect || '/');
            }
        );


    }

}
