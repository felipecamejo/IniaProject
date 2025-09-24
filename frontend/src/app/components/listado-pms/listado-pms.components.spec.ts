import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoPmsComponents } from './listado-pms.components';

describe('ListadoPmsComponents', () => {
  let component: ListadoPmsComponents;
  let fixture: ComponentFixture<ListadoPmsComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoPmsComponents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoPmsComponents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
