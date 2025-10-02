import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoTetrazolioComponent } from './listado-tetrazolio.component';

describe('ListadoTetrazolioComponent', () => {
  let component: ListadoTetrazolioComponent;
  let fixture: ComponentFixture<ListadoTetrazolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoTetrazolioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoTetrazolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
