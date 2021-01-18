import { Component, HostListener } from '@angular/core';
declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  @HostListener('window:scroll', ['$event', '$event.target'])
  doSomethingOnScroll($event: Event) {
    let backToTop = $('.back-to-top');
    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
      backToTop.addClass('back-to-top-show');
      setTimeout(function(){
        backToTop.removeClass('back-to-top-show');
      },5000);
    } else {
      backToTop.removeClass('back-to-top-show');
    }
  }

  scrollToTop() {
    (function smoothscroll() {
        const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
            window.requestAnimationFrame(smoothscroll);
            window.scrollTo(0, currentScroll - (currentScroll / 5));
        }
    })();
  }

}
