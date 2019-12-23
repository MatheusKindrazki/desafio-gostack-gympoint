import { addMonths, parseISO } from 'date-fns';
import * as Yup from 'yup';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

class EnrollmentController {
  async index(req, res) {
    const { page = 1, quantity = 20 } = req.query;

    const { rows: enrollments, count } = await Enrollment.findAndCountAll({
      limit: quantity,
      offset: (page - 1) * quantity,
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
      order: [['updated_at', 'desc']],
    });

    return res
      .set({ 'Total-Pages': Math.ceil(count / quantity) })
      .json(enrollments);
  }

  async show(req, res) {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist.' });
    }

    return res.json(enrollment);
  }

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

    const { id } = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json({
      id,
      student_id,
      plan_id,
      price,
      start_date,
      end_date,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const { student_id, plan_id, start_date } = req.body;

    const enrollment = await Enrollment.findByPk(id);
    const plan = await Plan.findByPk(plan_id);

    // Verifica se o administrador pode editar
    if (student_id !== enrollment.student_id) {
      const studentEnrollmentExists = await Enrollment.findOne({
        where: { student_id },
      });

      if (studentEnrollmentExists) {
        return res
          .status(401)
          .json({ error: 'A enrollment with this student already exists' });
      }
    }

    let { price, end_date } = enrollment;

    // Calcula o preço completo e a data de término
    if (plan_id !== enrollment.plan_id) {
      price = plan.duration * plan.price;
      end_date = addMonths(parseISO(start_date), plan.duration);
    }

    // Calcula a nova data final
    if (start_date !== enrollment.start_date) {
      end_date = addMonths(parseISO(start_date), plan.duration);
    }

    await enrollment.update({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    await enrollment.save();

    return res.json({
      id,
      student_id,
      plan_id,
      price,
      start_date,
      end_date,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist.' });
    }

    await enrollment.destroy();

    return res.json({ message: 'Enrollment deleted successfully.' });
  }
}

export default new EnrollmentController();
