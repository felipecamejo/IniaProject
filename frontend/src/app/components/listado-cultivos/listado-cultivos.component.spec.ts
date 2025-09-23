import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoCultivosComponent } from './listado-cultivos.component';

describe('ListadoCultivosComponent', () => {
  let component: ListadoCultivosComponent;
  let fixture: ComponentFixture<ListadoCultivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoCultivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoCultivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
