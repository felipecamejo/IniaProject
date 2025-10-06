import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoDepositosComponent } from './listado-depositos.component';

describe('ListadoDepositosComponent', () => {
  let component: ListadoDepositosComponent;
  let fixture: ComponentFixture<ListadoDepositosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoDepositosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoDepositosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
