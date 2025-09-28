import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoPmsComponent } from './listado-pms.component';

describe('ListadoPmsComponent', () => {
  let component: ListadoPmsComponent;
  let fixture: ComponentFixture<ListadoPmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoPmsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoPmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
