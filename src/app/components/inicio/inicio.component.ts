import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: false,
})
export class InicioComponent {
    isModalOpen = false;

    openContactModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }


ngOnInit() {}

ngAfterViewInit() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('hidden');
        } else {
          entry.target.classList.remove('visible');
          entry.target.classList.add('hidden');
        }
      });
    }, {
      threshold: 0.1
    });

    sections.forEach(section => {
      section.classList.add('hidden');
      observer.observe(section);
    });
} }
