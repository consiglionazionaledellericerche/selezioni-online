import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { CacheService } from '../../core/cache.service';
import { CallService } from '../../core/call/call.service';
import { Call } from '../../core/call/call.model';
import { ApiMessageService, MessageType } from '../../core/api-message.service';
import { HelpdeskService } from './helpdesk.service';

@Component({
  standalone: false,
    selector: 'helpdesk',
    templateUrl: './helpdesk.component.html'
})
export class HelpDeskComponent implements OnInit {
    public static ROUTE = 'helpdesk';

    public form: FormGroup;
    public callTypes: any[] = [];
    public calls: Call[] = [];
    public loadingCalls = false;
    public sending = false;
    public sent = false;
    public isGuest = true;
    private allegato: File;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private cacheService: CacheService,
        private callService: CallService,
        private helpdeskService: HelpdeskService,
        private apiMessageService: ApiMessageService
    ) {}

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            confirmEmail: ['', [Validators.required, Validators.email]],
            phoneNumber: [''],
            callType: ['', Validators.required],
            callId: ['', Validators.required],
            problemType: ['', Validators.required],
            subject: ['', Validators.required],
            message: ['', Validators.required]
        }, { validators: HelpDeskComponent.emailMatch });

        const user = this.authService.isAuthenticated() ? this.authService.getUser() : null;
        if (user) {
            this.isGuest = false;
            this.form.patchValue({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                confirmEmail: user.email
            });
        }
        this.cacheService.cache().subscribe(cache => {
            this.callTypes = (cache.jsonlistCallType || []).filter(type => !type.childs);
        });
    }

    static emailMatch(group: AbstractControl): ValidationErrors | null {
        const email = group.get('email').value;
        const confirm = group.get('confirmEmail').value;
        return email && confirm && email.trim().toLowerCase() !== confirm.trim().toLowerCase() ?
            { emailMismatch: true } : null;
    }

    onChangeCallType() {
        const type: string = this.form.value.callType;
        this.form.patchValue({ callId: '' });
        this.calls = [];
        if (!type) {
            return;
        }
        this.loadingCalls = true;
        this.callService.getAll({
            page: 0,
            offset: 100,
            filterType: 'all',
            type: type.substring(2)
        }).subscribe(calls => {
            this.calls = calls;
            this.loadingCalls = false;
        }, () => this.loadingCalls = false);
    }

    onFileChange(event: any) {
        this.allegato = event.target.files && event.target.files.length ? event.target.files[0] : undefined;
    }

    onSubmit() {
        if (this.form.invalid) {
            return;
        }
        this.sending = true;
        const value = this.form.getRawValue();
        delete value.callType;
        this.helpdeskService.send(value, this.allegato).subscribe(() => {
            this.sending = false;
            this.sent = true;
        }, (message: string) => {
            this.sending = false;
            this.apiMessageService.sendMessage(MessageType.ERROR, message);
        });
    }
}
