import Leave from '../schema/LeaveSchema';
import EmployeeNotFound from '../Errors/Employee/EmployeeNotFound';

export const initialDashBoardData = async (req, res, next) => {
  let todayStart = new Date();
  todayStart.setHours(8, 0, 0);
  let todayEnd = new Date();
  todayEnd.setHours(21, 59, 59);

  let month = todayStart.getMonth();
  let year = todayStart.getFullYear();
  let FloorMonth = new Date(year, month, 1);
  let ceilMonth = new Date(year, month, 29);

  if (!req.user) {
    next(new EmployeeNotFound());
  } else {
    let userRole = req.user.employee.role;
    let userId = req.user.employee.id;

    const monthLeave = await Leave.find({
      requestFrom: req.user.employee.id,
      createdAt: {
        $gte: FloorMonth,
        $lte: ceilMonth,
      },
      status: 'approved',
    });

    let totalMonthLeave = monthLeave.length;

    const LeaveTaken = await Leave.find({
      requestFrom: req.user.employee.id,
      status: 'approved',
    });
    let totalLeave = LeaveTaken.length;

    const leave = await Leave.find({
      startDate: {
        $lte: todayStart,
      },
      endDate: {
        $gte: todayEnd,
      },
      status: 'approved',
    })
      .populate({
        path: 'requestFrom',
        populate: {
          path: 'team',
          select: {
            value: 1,
          },
        },
        select: {
          id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
        },
      })
      .populate({
        path: 'approvedBy',
        populate: {
          path: 'author ',
          select: {
            firstName: 1,
            lastName: 1,
            email: 1,
          },
          populate: {
            path: 'team',
            select: {
              value: 1,
            },
          },
        },
      })
      .populate({
        path: 'rejectedBy',
        populate: {
          path: 'author ',
          select: {
            firstName: 1,
            lastName: 1,
            email: 1,
          },
          populate: {
            path: 'team',
            select: {
              value: 1,
            },
          },
        },
      });

    const upComingLeaves = await Leave.find({
      startDate: {
        $gt: todayEnd,
      },
      status: 'approved',
    })
      .populate({
        path: 'requestFrom',
        populate: {
          path: 'team',
          select: {
            value: 1,
          },
        },
        select: {
          id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
        },
      })
      .populate({
        path: 'approvedBy',
        populate: {
          path: 'author ',
          select: {
            firstName: 1,
            lastName: 1,
            email: 1,
          },
          populate: {
            path: 'team',
            select: {
              value: 1,
            },
          },
        },
      })
      .populate({
        path: 'rejectedBy',
        populate: {
          path: 'author ',
          select: {
            firstName: 1,
            lastName: 1,
            email: 1,
          },
          populate: {
            path: 'team',
            select: {
              value: 1,
            },
          },
        },
      });

    if (
      userRole === 'TL' ||
      userRole === 'ADMIN' ||
      userRole === 'HR' ||
      userRole === 'PM'
    ) {
      const leaveRequests = await Leave.find({
        requestTo: userId,
        status: 'pending',
        requestFrom: {
          $ne: userId,
        },
        // startDate: {
        //   $lt: todayStart,
        // },
      })
        .populate('requestFrom', {
          firstName: 1,
          lastName: 1,
          email: 1,
        })
        .populate({
          path: 'approvedBy',
          populate: {
            path: 'author ',
            select: {
              firstName: 1,
              lastName: 1,
              email: 1,
            },
            populate: {
              path: 'team',
              select: {
                value: 1,
              },
            },
          },
        })
        .populate({
          path: 'rejectedBy',
          populate: {
            path: 'author ',
            select: {
              firstName: 1,
              lastName: 1,
              email: 1,
            },
            populate: {
              path: 'team',
              select: {
                value: 1,
              },
            },
          },
        });

      next({
        totalLeave: totalLeave,
        totalMonthLeave: totalMonthLeave,
        leaveRequests: leaveRequests || [],
        TodayOnleave: leave || [],
        upComingLeaves: upComingLeaves || [],
      });
    } else {
      next({
        totalLeave: totalLeave,
        totalMonthLeave: totalMonthLeave,
        leaveRequests: [],
        TodayOnleave: leave || [],
        upComingLeaves: upComingLeaves || [],
      });
    }
  }
};
