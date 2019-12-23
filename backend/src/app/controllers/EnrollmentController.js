import { addMonths, parseISO } from 'date-fns';
import * as Yup from 'yup';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // Verifica se este aluno já tem uma inscrição
    const enrollmentExists = await Enrollment.findOne({
      where: { student_id },
    });

    if (enrollmentExists) {
      return res.status(401).json({ error: 'Existing Registration.' });
    }

    // Calcula o preço completo e a data de término
    const plan = await Plan.findByPk(plan_id);

    const price = plan.duration * plan.price;
    const end_date = addMonths(parseISO(start_date), plan.duration);

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
