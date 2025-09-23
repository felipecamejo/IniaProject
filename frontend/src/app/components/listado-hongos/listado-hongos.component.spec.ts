import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoHongosComponent } from './listado-hongos.component';

describe('ListadoHongosComponent', () => {
  let component: ListadoHongosComponent;
  let fixture: ComponentFixture<ListadoHongosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoHongosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoHongosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
