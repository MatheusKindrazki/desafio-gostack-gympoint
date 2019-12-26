import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import AnswerMail from '../jobs/AnswerMail';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpAcademyController {
  async index(req, res) {
    const { page = 1, quantity = 20 } = req.query;

    const { rows: helpOrders, count } = await HelpOrder.findAndCountAll({
      where: { answer: null },
      limit: quantity,
      offset: (page - 1) * quantity,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['created_at']],
    });

    return res
      .set({ total_pages: Math.ceil(count / quantity) })
      .json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const { answer } = req.body;

    const helpOrder = await HelpOrder.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (helpOrder.answer_at) {
      return res
        .status(401)
        .json({ error: 'You can only answer a help order once' });
    }

    await helpOrder.update({ answer, answer_at: new Date() });

    await helpOrder.save();

    await Queue.add(AnswerMail.key, {
      helpOrder,
    });

    return res.json(helpOrder);
  }
}

export default new HelpAcademyController();
