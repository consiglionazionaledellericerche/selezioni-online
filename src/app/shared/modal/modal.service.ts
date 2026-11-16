import {
  ApplicationRef, ComponentRef, EmbeddedViewRef, EnvironmentInjector, Injectable, Injector, TemplateRef, Type, createComponent, inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

export interface ModalOptions<T = any> {
  /** Proprietà assegnate al componente prima della sua inizializzazione. */
  initialState?: Partial<T> | { [key: string]: any };
  /** Classi aggiunte a .modal-dialog (es. 'modal-lg', 'modal-dialog-centered'). */
  class?: string;
  animated?: boolean;
  /** Se true il click sullo sfondo non chiude la finestra. */
  ignoreBackdropClick?: boolean;
  /** Se false il tasto Esc non chiude la finestra. */
  keyboard?: boolean;
}

/**
 * Riferimento a una finestra aperta con ModalService; viene anche iniettato nel componente mostrato.
 * Fuori da una finestra se ne ottiene un'istanza neutra (hide non fa nulla), come con ngx-bootstrap.
 */
@Injectable({ providedIn: 'root', useFactory: () => new ModalRef() })
export class ModalRef<T = any> {
  public content: T;
  public readonly onHidden = new Subject<void>();
  /** @internal */
  public closeFn: () => void = () => {};

  hide(): void {
    this.closeFn();
  }
}

/**
 * Finestre modali con il markup di Bootstrap Italia (come ModalComponent/DialogHost di GesFor),
 * per componenti creati dinamicamente. Sostituisce BsModalService di ngx-bootstrap mantenendone
 * l'interfaccia usata nell'applicazione: show(componente, { initialState, class }) e ModalRef.hide().
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly open: ModalRef[] = [];

  show<T>(component: Type<T> | TemplateRef<any>, options: ModalOptions<T> = {}): ModalRef<T> {
    const ref = new ModalRef<T>();
    const doc = this.document;

    const modal = doc.createElement('div');
    // senza it-dialog-scrollable: in Bootstrap Italia porta la finestra a tutta altezza
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    const dialog = doc.createElement('div');
    const sizeClasses = (options.class || '').split(' ').filter(c => c.startsWith('modal-'));
    const hasSize = sizeClasses.some(c => ['modal-sm', 'modal-lg', 'modal-xl', 'modal-fullscreen'].includes(c));
    // senza dimensione esplicita la finestra si adatta alla larghezza del contenuto
    dialog.className = ['modal-dialog', 'modal-dialog-scrollable', ...(hasSize ? [] : ['modal-dialog-auto']), ...sizeClasses].join(' ');
    dialog.setAttribute('role', 'document');
    const content = doc.createElement('div');
    content.className = 'modal-content';
    dialog.appendChild(content);
    modal.appendChild(dialog);
    const backdrop = doc.createElement('div');
    backdrop.className = 'modal-backdrop fade show';

    // contenuto: componente creato dinamicamente oppure ng-template del componente chiamante
    let componentRef: ComponentRef<T> = null;
    let templateView: EmbeddedViewRef<any> = null;
    if (component instanceof TemplateRef) {
      templateView = component.createEmbeddedView({ $implicit: ref, modalRef: ref });
      templateView.rootNodes.forEach(node => content.appendChild(node));
    } else {
      const elementInjector = Injector.create({ providers: [{ provide: ModalRef, useValue: ref }], parent: this.injector });
      componentRef = createComponent(component, {
        environmentInjector: this.environmentInjector,
        elementInjector,
      });
      Object.assign(componentRef.instance as any, options.initialState || {});
      ref.content = componentRef.instance;
      // l'elemento del componente non deve interrompere il layout flex di .modal-content
      // (header / body / footer devono comportarsi come figli diretti: corpo scorrevole, header e footer fissi)
      (componentRef.location.nativeElement as HTMLElement).style.display = 'contents';
      content.appendChild(componentRef.location.nativeElement);
    }

    const previousFocus = doc.activeElement as HTMLElement;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && options.keyboard !== false && this.open[this.open.length - 1] === ref) {
        ref.hide();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === modal && !options.ignoreBackdropClick) {
        ref.hide();
      }
    };
    modal.addEventListener('mousedown', onClick);
    doc.addEventListener('keydown', onKeydown);

    let closed = false;
    ref.closeFn = () => {
      if (closed) {
        return;
      }
      closed = true;
      doc.removeEventListener('keydown', onKeydown);
      const view = componentRef ? componentRef.hostView : templateView;
      this.appRef.detachView(view);
      view.destroy();
      modal.remove();
      backdrop.remove();
      this.open.splice(this.open.indexOf(ref), 1);
      if (this.open.length === 0) {
        doc.body.classList.remove('modal-open');
      }
      previousFocus?.focus?.();
      ref.onHidden.next();
      ref.onHidden.complete();
    };

    doc.body.appendChild(backdrop);
    doc.body.appendChild(modal);
    doc.body.classList.add('modal-open');
    this.open.push(ref);
    const view = componentRef ? componentRef.hostView : templateView;
    this.appRef.attachView(view);
    view.detectChanges();
    modal.focus();
    return ref;
  }

  /** Chiude l'ultima finestra aperta. */
  hide(): void {
    this.open[this.open.length - 1]?.hide();
  }
}
