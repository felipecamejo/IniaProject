import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoMalezasComponent } from './listado-malezas.component';

describe('ListadoMalezasComponent', () => {
  let component: ListadoMalezasComponent;
  let fixture: ComponentFixture<ListadoMalezasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoMalezasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoMalezasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
