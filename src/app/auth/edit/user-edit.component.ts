import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit{

    ngForm: FormGroup;
    submitted = false;

    constructor(private formBuilder: FormBuilder,
                private authService: AuthService, 
                private router: Router) { }

    ngOnInit() {
        this.ngForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', Validators.required],
        });
    }
    // convenience getter for easy access to form fields
    get f() { return this.ngForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.ngForm.invalid) {
            return;
        }

    }
}
