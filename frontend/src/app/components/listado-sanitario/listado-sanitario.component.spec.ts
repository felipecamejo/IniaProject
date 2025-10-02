import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoSanitarioComponent } from './listado-sanitario.component';

describe('ListadoSanitarioComponent', () => {
  let component: ListadoSanitarioComponent;
  let fixture: ComponentFixture<ListadoSanitarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoSanitarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoSanitarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
