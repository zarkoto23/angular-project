import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  templateUrl: './error-modal.html',
  styleUrls: ['./error-modal.css']
})
export class ErrorModal {
  @Input() isVisible: boolean = false;
  @Input() message: string = '';
  @Output() closed = new EventEmitter<void>();
  
  onClose() {
    this.closed.emit();
  }
}