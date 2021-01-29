import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FAQService} from './faq.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'faq',
    templateUrl: './faq.component.html',
    styles: [
        '.carousel-control {top: 50px;bottom: auto; width: 5%}',
        '.carousel-indicators {top: 0;bottom: auto;}'
    ]
})
export class FAQComponent implements OnInit{
    public static ROUTE = 'faq';
    faqs: Map<string, any> = new Map<string, any>();

    constructor(private faqService: FAQService) {
    }
    
    ngOnInit(): void {
        this.faqService.faqs().subscribe((faqs) => {
            this.faqs = faqs;
        });
    }
}